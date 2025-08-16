import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  BookmarkIcon,
  ShareIcon,
  AdjustmentsHorizontalIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { ProfileType } from '../types';

interface Job {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: {
    city: string;
    state: string;
    country: string;
    isRemote: boolean;
    isHybrid: boolean;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'annually' | 'monthly';
  };
  industryType: ProfileType[];
  skills: string[];
  postedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    company: string;
    profilePicture?: string;
  };
  applicants: number;
  postedAt: string;
  expiresAt: string;
  isBookmarked: boolean;
  hasApplied: boolean;
}

const JobsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('all');
  const [experienceLevelFilter, setExperienceLevelFilter] = useState<string>('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      
      // Mock job data
      const mockJobs: Job[] = [
        {
          _id: 'job1',
          title: 'Manufacturing Operations Manager',
          company: 'TechManufacturing Corp',
          location: {
            city: 'Detroit',
            state: 'MI',
            country: 'USA',
            isRemote: false,
            isHybrid: true
          },
          description: 'Lead manufacturing operations for our automotive component division. Drive continuous improvement initiatives and manage a team of 50+ production workers.',
          requirements: [
            'Bachelor\'s degree in Engineering or Manufacturing',
            '5+ years of manufacturing operations experience',
            'Experience with Lean Manufacturing principles',
            'Strong leadership and communication skills',
            'Proficiency in ERP systems'
          ],
          benefits: [
            'Competitive salary and bonuses',
            'Health, dental, and vision insurance',
            '401(k) with company match',
            'Professional development opportunities',
            'Flexible work arrangements'
          ],
          employmentType: 'full-time',
          experienceLevel: 'mid',
          salaryRange: {
            min: 80000,
            max: 120000,
            currency: 'USD',
            period: 'annually'
          },
          industryType: ['Manufacturer'],
          skills: ['Manufacturing', 'Operations Management', 'Lean Manufacturing', 'Leadership'],
          postedBy: {
            _id: 'recruiter1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            company: 'TechManufacturing Corp',
            profilePicture: undefined
          },
          applicants: 47,
          postedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          expiresAt: new Date(Date.now() + 86400000 * 28).toISOString(), // 28 days from now
          isBookmarked: false,
          hasApplied: false
        },
        {
          _id: 'job2',
          title: 'Supply Chain Analyst',
          company: 'Global Retail Solutions',
          location: {
            city: 'New York',
            state: 'NY',
            country: 'USA',
            isRemote: true,
            isHybrid: false
          },
          description: 'Analyze supply chain data to optimize inventory levels and reduce costs. Work with cross-functional teams to improve procurement processes.',
          requirements: [
            'Bachelor\'s degree in Supply Chain, Business, or related field',
            '3+ years of supply chain analysis experience',
            'Proficiency in Excel, SQL, and data visualization tools',
            'Experience with supply chain management software',
            'Strong analytical and problem-solving skills'
          ],
          benefits: [
            'Remote work opportunity',
            'Comprehensive health benefits',
            'Stock options',
            'Learning and development budget',
            'Flexible PTO policy'
          ],
          employmentType: 'full-time',
          experienceLevel: 'mid',
          salaryRange: {
            min: 65000,
            max: 85000,
            currency: 'USD',
            period: 'annually'
          },
          industryType: ['Retailer', 'Distributor'],
          skills: ['Supply Chain', 'Data Analysis', 'SQL', 'Excel'],
          postedBy: {
            _id: 'recruiter2',
            firstName: 'Michael',
            lastName: 'Chen',
            company: 'Global Retail Solutions'
          },
          applicants: 23,
          postedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          expiresAt: new Date(Date.now() + 86400000 * 25).toISOString(),
          isBookmarked: true,
          hasApplied: false
        },
        {
          _id: 'job3',
          title: 'Junior Manufacturing Engineer',
          company: 'Precision Components Inc',
          location: {
            city: 'Phoenix',
            state: 'AZ',
            country: 'USA',
            isRemote: false,
            isHybrid: false
          },
          description: 'Entry-level position supporting manufacturing engineering activities. Great opportunity for recent graduates to learn and grow in a dynamic manufacturing environment.',
          requirements: [
            'Bachelor\'s degree in Mechanical, Industrial, or Manufacturing Engineering',
            '0-2 years of experience',
            'Knowledge of CAD software (SolidWorks preferred)',
            'Understanding of manufacturing processes',
            'Strong problem-solving skills'
          ],
          benefits: [
            'Mentorship program',
            'Health and dental insurance',
            'Tuition reimbursement',
            'Career advancement opportunities',
            '401(k) plan'
          ],
          employmentType: 'full-time',
          experienceLevel: 'entry',
          salaryRange: {
            min: 55000,
            max: 70000,
            currency: 'USD',
            period: 'annually'
          },
          industryType: ['Manufacturer', 'Contract Manufacturer'],
          skills: ['Manufacturing Engineering', 'CAD', 'SolidWorks', 'Process Improvement'],
          postedBy: {
            _id: 'recruiter3',
            firstName: 'Lisa',
            lastName: 'Williams',
            company: 'Precision Components Inc'
          },
          applicants: 156,
          postedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          expiresAt: new Date(Date.now() + 86400000 * 23).toISOString(),
          isBookmarked: false,
          hasApplied: true
        }
      ];

      setJobs(mockJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = async (jobId: string) => {
    setLoadingActions(prev => ({ ...prev, [`bookmark_${jobId}`]: true }));
    try {
      // TODO: Send API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setJobs(prev => 
        prev.map(job => 
          job._id === jobId 
            ? { ...job, isBookmarked: !job.isBookmarked }
            : job
        )
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`bookmark_${jobId}`]: false }));
    }
  };

  const applyToJob = async (jobId: string) => {
    setLoadingActions(prev => ({ ...prev, [`apply_${jobId}`]: true }));
    try {
      // TODO: Send API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setJobs(prev => 
        prev.map(job => 
          job._id === jobId 
            ? { ...job, hasApplied: true, applicants: job.applicants + 1 }
            : job
        )
      );
    } catch (error) {
      console.error('Error applying to job:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`apply_${jobId}`]: false }));
    }
  };

  const getFilteredJobs = () => {
    return jobs.filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesLocation = 
        !locationFilter ||
        job.location.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        job.location.state.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesIndustry = 
        industryFilter === 'all' || 
        job.industryType.includes(industryFilter as ProfileType);
      
      const matchesEmploymentType = 
        employmentTypeFilter === 'all' || 
        job.employmentType === employmentTypeFilter;
      
      const matchesExperienceLevel = 
        experienceLevelFilter === 'all' || 
        job.experienceLevel === experienceLevelFilter;
      
      const matchesRemote = 
        !remoteOnly || job.location.isRemote;
      
      return matchesSearch && matchesLocation && matchesIndustry && 
             matchesEmploymentType && matchesExperienceLevel && matchesRemote;
    });
  };

  const formatSalary = (salaryRange: Job['salaryRange']) => {
    const { min, max, currency, period } = salaryRange;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    const periodText = period === 'annually' ? '/year' : period === 'monthly' ? '/month' : '/hour';
    return `${formatter.format(min)} - ${formatter.format(max)} ${periodText}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const JobCard: React.FC<{ job: Job }> = ({ job }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linkedin-blue flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-linkedin-blue cursor-pointer">
                  {job.title}
                </h3>
                <p className="text-gray-600 font-medium">{job.company}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {job.location.isRemote ? 'Remote' : `${job.location.city}, ${job.location.state}`}
                    {job.location.isHybrid && !job.location.isRemote && ' (Hybrid)'}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {getTimeAgo(job.postedAt)}
                  </div>
                  <div className="flex items-center">
                    <BriefcaseIcon className="w-4 h-4 mr-1" />
                    {job.applicants} applicants
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleBookmark(job._id)}
                  disabled={loadingActions[`bookmark_${job._id}`]}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title={job.isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
                >
                  {loadingActions[`bookmark_${job._id}`] ? (
                    <LoadingSpinner size="sm" />
                  ) : job.isBookmarked ? (
                    <BookmarkSolidIcon className="w-5 h-5 text-linkedin-blue" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5" />
                  )}
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600" title="Share job">
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center text-sm text-gray-600 space-x-4">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                  {formatSalary(job.salaryRange)}
                </div>
                <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                <span className="capitalize">{job.experienceLevel} level</span>
              </div>
            </div>

            <p className="text-gray-700 mt-3 line-clamp-2">{job.description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full overflow-hidden">
                  {job.postedBy.profilePicture ? (
                    <img
                      src={job.postedBy.profilePicture}
                      alt={`${job.postedBy.firstName} ${job.postedBy.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linkedin-blue flex items-center justify-center text-white text-xs font-bold">
                      {job.postedBy.firstName[0]}
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  Posted by {job.postedBy.firstName} {job.postedBy.lastName}
                </span>
              </div>

              <div className="flex space-x-2">
                {job.hasApplied ? (
                  <div className="btn-secondary cursor-not-allowed">
                    Applied
                  </div>
                ) : (
                  <button
                    onClick={() => applyToJob(job._id)}
                    disabled={loadingActions[`apply_${job._id}`]}
                    className="btn-primary"
                  >
                    {loadingActions[`apply_${job._id}`] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredJobs = getFilteredJobs();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Jobs</h1>
        <p className="text-gray-600">
          Discover opportunities in manufacturing, retail, and distribution
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Search */}
          <div className="lg:col-span-4 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div className="lg:col-span-3 relative">
            <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
            />
          </div>

          {/* Filters Toggle */}
          <div className="lg:col-span-5 flex items-center justify-end space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remote-only"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="h-4 w-4 text-linkedin-blue focus:ring-linkedin-blue border-gray-300 rounded"
              />
              <label htmlFor="remote-only" className="text-sm text-gray-700">
                Remote only
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">More filters:</span>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Industries</option>
            <option value="Manufacturer">Manufacturing</option>
            <option value="Retailer">Retail</option>
            <option value="Distributor">Distribution</option>
            <option value="Contract Manufacturer">Contract Manufacturing</option>
            <option value="Service Provider">Service Provider</option>
          </select>

          <select
            value={employmentTypeFilter}
            onChange={(e) => setEmploymentTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
            <option value="internship">Internship</option>
          </select>

          <select
            value={experienceLevelFilter}
            onChange={(e) => setExperienceLevelFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="executive">Executive</option>
          </select>

          <button className="btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </h2>
        <select className="input-field">
          <option value="recent">Most Recent</option>
          <option value="relevant">Most Relevant</option>
          <option value="salary-high">Salary: High to Low</option>
          <option value="salary-low">Salary: Low to High</option>
        </select>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))
        ) : (
          <div className="text-center py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
